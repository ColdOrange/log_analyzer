defmodule LogAnalyzer.Server.API.Reports.UserAgent do
  require Logger
  alias LogAnalyzer.Repo
  import Plug.Conn
  import Ecto.Query, only: [from: 2]

  def get_os(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          os: log.ua_os,
          count: count(log.id)
        },
        where: not is_nil(log.ua_os),
        group_by: log.ua_os,
        order_by: [desc: count(log.id)]

    send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  end

  def get_device(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          device: log.ua_device,
          count: count(log.id)
        },
        where: not is_nil(log.ua_device),
        group_by: log.ua_device,
        order_by: [desc: count(log.id)]

    send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  end

  def get_browser(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          browser: log.ua_browser,
          pv: count(log.id),
          uv: count(log.ip, :distinct)
        },
        where: not is_nil(log.ua_browser),
        group_by: log.ua_browser,
        order_by: [desc: count(log.id)]

    send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  end
end
