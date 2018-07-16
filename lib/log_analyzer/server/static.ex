defmodule LogAnalyzer.Server.Static do
  use Plug.Builder

  plug Plug.Static,
    at: "/",
    from: "assets/static"

  plug :not_found

  def not_found(conn, _opts) do
    send_resp(conn, 404, "not found")
  end
end
