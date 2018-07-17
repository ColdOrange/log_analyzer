defmodule LogAnalyzer.Server.API.Reports.Referrer do
  require Logger
  alias LogAnalyzer.Repo
  import Plug.Conn
  import Ecto.Query, only: [from: 2]

  def get_referring_site(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          site: log.referrer_site,
          pv: count(log.id),
          uv: count(log.ip, :distinct)
        },
        where: not is_nil(log.referrer_site),
        group_by: log.referrer_site,
        order_by: [desc: count(log.id)]

    send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  end

  def get_referring_url(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          url: log.referrer_path,
          pv: count(log.id),
          uv: count(log.ip, :distinct)
        },
        where: not is_nil(log.referrer_path),
        group_by: log.referrer_path,
        order_by: [desc: count(log.id)]

    send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  end
end
