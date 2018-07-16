defmodule LogAnalyzer.Server.Router do
  use Plug.Router

  plug Plug.Logger
  plug :match
  plug :dispatch

  # static files
  forward "/static", to: LogAnalyzer.Server.Static

  # api service
  forward "/api", to: LogAnalyzer.Server.API

  # otherwise, just send index page and let front end do the route
  match _ do
    send_file(conn, 200, "assets/static/index.html")
  end
end
