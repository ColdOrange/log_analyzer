defmodule LogAnalyzer.Server.API.Reports do
  require Logger
  use Plug.Router
  alias LogAnalyzer.Repo
  import Ecto.Query, only: [from: 2]
  import LogAnalyzer.Server.API.Util

  plug :match
  plug :dispatch

  get "/" do
    unless Repo.Supervisor.repo_started?() do
      send_error(conn, "Database uninitialized")
    else
      query =
        from r in "report",
          select: %{id: r.id, file: r.file},
          order_by: [asc: r.id]

      send_resp(conn, 200, Poison.encode!(Repo.all(query)))
    end
  end

  delete "/:id" do
    with :ok <- Repo.Migrator.drop_log_table(id),
         :ok <- Repo.Migrator.delete_from_report_table(id) do
      send_success(conn)
    else
      {:error, message} ->
        Logger.error(message)
        send_error(conn, message)
    end
  end

  alias LogAnalyzer.Server.API.Reports.Summary

  get "/:id/summary" do
    Summary.get_summary(conn, id)
  end

  alias LogAnalyzer.Server.API.Reports.PageViews

  get "/:id/page-views/daily" do
    PageViews.get_page_views_daily(conn, id)
  end

  get "/:id/page-views/hourly" do
    PageViews.get_page_views_hourly(conn, id)
  end

  get "/:id/page-views/monthly" do
    PageViews.get_page_views_monthly(conn, id)
  end

  alias LogAnalyzer.Server.API.Reports.UserViews

  get "/:id/user-views/daily" do
    UserViews.get_user_views_daily(conn, id)
  end

  get "/:id/user-views/hourly" do
    UserViews.get_user_views_hourly(conn, id)
  end

  get "/:id/user-views/monthly" do
    UserViews.get_user_views_monthly(conn, id)
  end

  match _ do
    send_resp(conn, 404, ~s/{"error": "not found"}/)
  end
end
