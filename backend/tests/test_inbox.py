from fastapi.testclient import TestClient


def create_item(
    client: TestClient,
    *,
    content: str = "跟进天津现场网络问题\n补充复现日志",
    item_type: str = "ISSUE",
) -> dict:
    response = client.post(
        "/api/v1/inbox",
        json={"content": content, "type": item_type, "project_id": None},
    )
    assert response.status_code == 201
    return response.json()


def test_create_item_persists_content_and_builds_title(client: TestClient) -> None:
    item = create_item(client)

    assert item["title"] == "跟进天津现场网络问题"
    assert item["content"] == "跟进天津现场网络问题\n补充复现日志"
    assert item["status"] == "INBOX"
    assert item["project_id"] is None
    assert item["created_at"].endswith(("Z", "+00:00"))


def test_create_item_limits_generated_title(client: TestClient) -> None:
    item = create_item(client, content="测" * 100, item_type="TODO")

    assert len(item["title"]) == 80
    assert item["title"].endswith("…")
    assert item["content"] == "测" * 100


def test_create_rejects_blank_content(client: TestClient) -> None:
    response = client.post(
        "/api/v1/inbox",
        json={"content": "  \n  ", "type": "TODO"},
    )

    assert response.status_code == 422


def test_create_rejects_invalid_type(client: TestClient) -> None:
    response = client.post(
        "/api/v1/inbox",
        json={"content": "有效内容", "type": "UNKNOWN"},
    )

    assert response.status_code == 422


def test_list_items_is_paginated_and_newest_first(client: TestClient) -> None:
    first = create_item(client, content="第一条")
    second = create_item(client, content="第二条")

    response = client.get("/api/v1/inbox?page=1&page_size=1")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    assert payload["pages"] == 2
    assert payload["items"][0]["id"] == second["id"]
    assert payload["items"][0]["id"] != first["id"]


def test_get_item_detail(client: TestClient) -> None:
    item = create_item(client)

    response = client.get(f"/api/v1/inbox/{item['id']}")

    assert response.status_code == 200
    assert response.json()["content"] == item["content"]


def test_update_item_rebuilds_title_and_status(client: TestClient) -> None:
    item = create_item(client)

    response = client.patch(
        f"/api/v1/inbox/{item['id']}",
        json={
            "content": "已确认根因\n准备关闭",
            "type": "BUG",
            "status": "PROCESSED",
        },
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["title"] == "已确认根因"
    assert updated["type"] == "BUG"
    assert updated["status"] == "PROCESSED"
    assert updated["archived_at"] is None


def test_update_rejects_null_content_and_enum(client: TestClient) -> None:
    item = create_item(client)

    assert client.patch(f"/api/v1/inbox/{item['id']}", json={"content": None}).status_code == 422
    assert client.patch(f"/api/v1/inbox/{item['id']}", json={"type": None}).status_code == 422


def test_archive_item_sets_archive_state(client: TestClient) -> None:
    item = create_item(client)

    response = client.post(f"/api/v1/inbox/{item['id']}/archive")

    assert response.status_code == 200
    archived = response.json()
    assert archived["status"] == "ARCHIVED"
    assert archived["archived_at"] is not None


def test_delete_item_removes_it(client: TestClient) -> None:
    item = create_item(client)

    response = client.delete(f"/api/v1/inbox/{item['id']}")

    assert response.status_code == 204
    assert client.get(f"/api/v1/inbox/{item['id']}").status_code == 404


def test_missing_item_returns_404(client: TestClient) -> None:
    response = client.get("/api/v1/inbox/9999")

    assert response.status_code == 404


def test_list_filters_by_type_and_status(client: TestClient) -> None:
    create_item(client, content="一般待办", item_type="TODO")
    bug = create_item(client, content="关键缺陷", item_type="BUG")
    client.post(f"/api/v1/inbox/{bug['id']}/archive")

    response = client.get("/api/v1/inbox?type=BUG&status=ARCHIVED")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["id"] == bug["id"]


def test_list_searches_title_and_content(client: TestClient) -> None:
    create_item(client, content="UWB 压测\n记录稳定性数据")
    create_item(client, content="普通待办\n天津现场需要复测")

    response = client.get("/api/v1/inbox?q=天津")

    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_invalid_pagination_returns_422(client: TestClient) -> None:
    assert client.get("/api/v1/inbox?page=0").status_code == 422
    assert client.get("/api/v1/inbox?page_size=101").status_code == 422
