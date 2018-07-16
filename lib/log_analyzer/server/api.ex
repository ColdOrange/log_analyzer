defmodule LogAnalyzer.Server.API do
  use Plug.Router

  # :put_resp_content_type should be plugged before :dispatch
  plug :put_resp_content_type, "application/json"
  plug :match
  plug :dispatch

  forward "/config", to: LogAnalyzer.Server.API.Config
  forward "/reports", to: LogAnalyzer.Server.API.Reports

  match _ do
    send_resp(conn, 404, ~s/{"error": "not found"}/)
  end
end
