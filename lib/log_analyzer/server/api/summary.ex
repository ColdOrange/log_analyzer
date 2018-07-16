defmodule LogAnalyzer.Server.API.Summary do
  use Plug.Router

  get "/" do
    send_resp(conn, 200, "hello world")
  end
end
