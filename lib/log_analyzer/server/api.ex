defmodule LogAnalyzer.Server.API do
  use Plug.Router

  alias LogAnalyzer.Server.API.{
    Reports,
    Summary
  }

  plug :match
  plug :dispatch

  plug :put_resp_content_type, "application/json"

  forward "/reports", to: Reports

  plug :not_found

  def not_found(conn, _opts) do
    send_resp(conn, 404, ~s/{"error": "not found"}/)
  end
end
