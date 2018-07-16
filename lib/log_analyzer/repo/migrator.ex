defmodule LogAnalyzer.Repo.Migrator do
  alias LogAnalyzer.Repo

  # TODO: support more drivers other than Postgres

  def create_report_table() do
    query = """
    CREATE TABLE report (
      id   serial PRIMARY KEY,
      file text NOT NULL
    )
    """

    case Repo.query(query) do
      {:ok, _} -> :ok
      {:error, exception} -> {:error, "Create report table error: #{exception.message}"}
    end
  end

  def create_log_table(id) do
    query = """
    CREATE TABLE log_#{id} (
      id             serial PRIMARY KEY,
      ip             varchar(46),
      time           timestamp,
      request_method varchar(10),
      url_path       text,
      url_query      text,
      url_is_static  boolean DEFAULT false,
      http_version   varchar(10),
      response_code  smallint,
      response_time  integer,
      content_size   integer,
      ua_browser     text,
      ua_os          text,
      ua_device      text,
      referrer_site  text,
      referrer_path  text,
      referrer_query text
    )
    """

    case Repo.query(query) do
      {:ok, _} -> :ok
      {:error, exception} -> {:error, "Create log_#{id} table error: #{exception.message}"}
    end
  end

  def drop_log_table(id) do
    query = "DROP TABLE IF EXISTS log_#{id}"

    case Repo.query(query) do
      {:ok, _} -> :ok
      {:error, exception} -> {:error, "Drop log_#{id} table error: #{exception.message}"}
    end
  end

  def delete_from_report_table(id) do
    query = "DELETE FROM report WHERE id=#{id}"

    case Repo.query(query) do
      {:ok, _} ->
        :ok

      {:error, exception} ->
        {:error, "Delete from report table error (id:#{id}): #{exception.message}"}
    end
  end
end
