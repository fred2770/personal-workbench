from fastapi.testclient import TestClient


def create_project(
    client: TestClient,
    *,
    name: str = "个人工作台 Phase 3",
    description: str = "建立真实项目管理闭环",
    status: str = "PLANNING",
    priority: str = "NORMAL",
    progress: int = 0,
) -> dict:
    response = client.post(
        "/api/v1/projects",
        json={
            "name": name,
            "description": description,
            "status": status,
            "priority": priority,
            "progress": progress,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_create_project(client: TestClient) -> None:
    project = create_project(client, status="ACTIVE", priority="HIGH", progress=35)

    assert project["name"] == "个人工作台 Phase 3"
    assert project["status"] == "ACTIVE"
    assert project["priority"] == "HIGH"
    assert project["progress"] == 35
    assert project["archived_at"] is None


def test_create_project_rejects_blank_name(client: TestClient) -> None:
    response = client.post(
        "/api/v1/projects",
        json={"name": "   ", "description": "无效项目"},
    )

    assert response.status_code == 422


def test_list_projects(client: TestClient) -> None:
    create_project(client, name="项目 A")
    create_project(client, name="项目 B")

    response = client.get("/api/v1/projects?page=1&page_size=1")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    assert payload["pages"] == 2
    assert len(payload["items"]) == 1


def test_get_project_detail(client: TestClient) -> None:
    project = create_project(client)

    response = client.get(f"/api/v1/projects/{project['id']}")

    assert response.status_code == 200
    assert response.json()["description"] == "建立真实项目管理闭环"


def test_update_project(client: TestClient) -> None:
    project = create_project(client)

    response = client.patch(
        f"/api/v1/projects/{project['id']}",
        json={"name": "Phase 3 已更新", "description": "更新后的项目说明", "progress": 48},
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["name"] == "Phase 3 已更新"
    assert updated["description"] == "更新后的项目说明"
    assert updated["progress"] == 48


def test_update_project_status(client: TestClient) -> None:
    project = create_project(client)

    response = client.patch(
        f"/api/v1/projects/{project['id']}",
        json={"status": "COMPLETED"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "COMPLETED"


def test_progress_accepts_zero(client: TestClient) -> None:
    project = create_project(client, progress=0)

    assert project["progress"] == 0


def test_progress_accepts_one_hundred(client: TestClient) -> None:
    project = create_project(client, progress=100)

    assert project["progress"] == 100


def test_progress_rejects_negative_value(client: TestClient) -> None:
    response = client.post("/api/v1/projects", json={"name": "无效进度", "progress": -1})

    assert response.status_code == 422


def test_progress_rejects_value_above_one_hundred(client: TestClient) -> None:
    response = client.post("/api/v1/projects", json={"name": "无效进度", "progress": 101})

    assert response.status_code == 422


def test_filter_projects_by_status(client: TestClient) -> None:
    create_project(client, name="规划项目", status="PLANNING")
    active = create_project(client, name="进行项目", status="ACTIVE")

    response = client.get("/api/v1/projects?status=ACTIVE")

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["id"] == active["id"]


def test_filter_projects_by_priority(client: TestClient) -> None:
    create_project(client, name="普通项目", priority="NORMAL")
    high = create_project(client, name="高优项目", priority="HIGH")

    response = client.get("/api/v1/projects?priority=HIGH")

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["id"] == high["id"]


def test_search_projects_by_name_and_description(client: TestClient) -> None:
    create_project(client, name="UWB 稳定性测试", description="压力测试")
    create_project(client, name="普通项目", description="天津现场反馈闭环")

    name_search = client.get("/api/v1/projects?q=UWB")
    description_search = client.get("/api/v1/projects?q=天津")

    assert name_search.status_code == 200
    assert name_search.json()["total"] == 1
    assert description_search.status_code == 200
    assert description_search.json()["total"] == 1


def test_archive_project_is_hidden_by_default_and_filterable(client: TestClient) -> None:
    project = create_project(client, status="ACTIVE")

    archive_response = client.post(f"/api/v1/projects/{project['id']}/archive")

    assert archive_response.status_code == 200
    assert archive_response.json()["status"] == "ARCHIVED"
    assert archive_response.json()["archived_at"] is not None
    assert client.get("/api/v1/projects").json()["total"] == 0
    assert client.get("/api/v1/projects?status=ARCHIVED").json()["total"] == 1


def test_delete_project(client: TestClient) -> None:
    project = create_project(client)

    response = client.delete(f"/api/v1/projects/{project['id']}")

    assert response.status_code == 204
    assert client.get(f"/api/v1/projects/{project['id']}").status_code == 404


def test_missing_project_returns_404(client: TestClient) -> None:
    assert client.get("/api/v1/projects/9999").status_code == 404
    assert client.patch("/api/v1/projects/9999", json={"name": "不存在"}).status_code == 404


def test_invalid_project_enum_returns_422(client: TestClient) -> None:
    assert client.post("/api/v1/projects", json={"name": "无效", "status": "UNKNOWN"}).status_code == 422
    assert client.post("/api/v1/projects", json={"name": "无效", "priority": "URGENT"}).status_code == 422


def test_inbox_item_can_reference_project(client: TestClient) -> None:
    project = create_project(client, name="关联项目", status="ACTIVE")

    response = client.post(
        "/api/v1/inbox",
        json={"content": "关联项目的快速记录", "type": "TODO", "project_id": project["id"]},
    )

    assert response.status_code == 201
    item = response.json()
    assert item["project_id"] == project["id"]
    assert item["project"]["name"] == "关联项目"


def test_deleting_project_preserves_inbox_item_and_clears_relation(client: TestClient) -> None:
    project = create_project(client, name="待删除项目")
    item = client.post(
        "/api/v1/inbox",
        json={"content": "项目删除后仍需保留", "type": "ISSUE", "project_id": project["id"]},
    ).json()

    delete_response = client.delete(f"/api/v1/projects/{project['id']}")
    inbox_response = client.get(f"/api/v1/inbox/{item['id']}")

    assert delete_response.status_code == 204
    assert inbox_response.status_code == 200
    assert inbox_response.json()["project_id"] is None
    assert inbox_response.json()["project"] is None
