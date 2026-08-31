import { Link } from "react-router-dom";
import { AppIcon } from "../components/AppIcon";
import type { NavigationItem } from "../config/navigation";

interface PlaceholderPageProps {
  page: NavigationItem;
}

export function PlaceholderPage({ page }: PlaceholderPageProps) {
  return (
    <div className="page-content placeholder-page">
      <section className="placeholder-panel">
        <span className="placeholder-icon"><AppIcon name={page.icon} size={22} /></span>
        <p className="section-label">{page.label}</p>
        <h2>该模块将在下一阶段开发</h2>
        <p>{page.description}。当前已保留正式路由与统一页面结构。</p>
        <Link className="button button--secondary" to="/dashboard">
          返回工作台
          <AppIcon name="arrow" size={15} />
        </Link>
      </section>
    </div>
  );
}
