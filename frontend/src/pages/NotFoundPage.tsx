import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="page-content placeholder-page">
      <section className="placeholder-panel">
        <p className="section-label">404</p>
        <h2>页面不存在</h2>
        <p>当前地址没有对应的工作台页面。</p>
        <Link className="button button--secondary" to="/dashboard">返回工作台</Link>
      </section>
    </div>
  );
}
