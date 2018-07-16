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
end
