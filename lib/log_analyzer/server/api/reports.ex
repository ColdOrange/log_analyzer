defmodule LogAnalyzer.Server.API.Reports do
  use Plug.Router

  plug :match
  plug :dispatch

  get "/" do
    send_resp(conn, 200, "hello\n")
  end
end
