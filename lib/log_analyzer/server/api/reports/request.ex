defmodule LogAnalyzer.Server.API.Reports.Request do
  require Logger
  alias LogAnalyzer.Repo
  import Plug.Conn
  import Ecto.Query, only: [from: 2]

  def get_request_method(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          requestMethod: log.request_method,
          count: count(log.id)
        },
        group_by: log.request_method,
        order_by: [desc: count(log.id)]

    send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  end

  def get_http_version(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          httpVersion: log.http_version,
          count: count(log.id)
        },
        group_by: log.http_version,
        order_by: [desc: count(log.id)]

    send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  end

  def get_request_url(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          url: log.url_path,
          pv: count(log.id),
          uv: count(log.ip, :distinct),
          bandwidth: sum(log.content_size)
        },
        where: log.url_is_static == false,
        group_by: log.url_path,
        order_by: [desc: count(log.id)]

    send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  end

  def get_static_file(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          file: log.url_path,
          count: count(log.id),
          bandwidth: sum(log.content_size)
        },
        where: log.url_is_static == true and log.response_code == 200,
        group_by: log.url_path,
        order_by: [desc: count(log.id)]

    send_resp(
      conn,
      200,
      query
      |> Repo.all()
      |> Enum.map(fn map -> Map.put(map, :size, Float.floor(map[:bandwidth] / map[:count], 2)) end)
      |> Poison.encode!()
    )
  end
end
