defmodule LogAnalyzer.Server.JSON do
  import Plug.Conn

  def json_error(conn, _opts) do
    send_resp(conn, 200, ~s/{"status": "failed"}/)
  end

  def json_success(conn, _opts) do
    send_resp(conn, 200, ~s/{"status": "successful"}/)
  end
end
