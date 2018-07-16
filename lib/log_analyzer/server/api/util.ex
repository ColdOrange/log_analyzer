defmodule LogAnalyzer.Server.API.Util do
  import Plug.Conn

  def send_error(conn, error) do
    send_resp(
      conn,
      200,
      Poison.encode!(%{
        status: "failed",
        error: error
      })
    )
  end

  def send_success(conn) do
    send_resp(conn, 200, ~s/{"status": "successful"}/)
  end
end
