defmodule LogAnalyzer.Server.API.Config do
  use Plug.Router
  alias LogAnalyzer.{DBConfig, LogConfig}
  import LogAnalyzer.Server.API.Util

  plug :match
  plug :dispatch

  get "/database" do
    send_resp(conn, 200, Poison.encode!(DBConfig.get()))
  end

  post "/database" do
    {:ok, body, conn} = read_body(conn)

    case DBConfig.set(body) do
      :ok -> send_success(conn)
      {:error, message} -> send_error(conn, message)
    end
  end

  get "/log-format" do
    send_resp(conn, 200, Poison.encode!(LogConfig.get()))
  end

  post "/log-format" do
    send_resp(conn, 200, "hello\n")
  end

  match _ do
    send_resp(conn, 404, ~s/{"error": "not found"}/)
  end
end
