defmodule LogAnalyzer.Repo.Migrator do
  alias LogAnalyzer.Repo

  def create_report_table() do
    Repo.query("""
    CREATE TABLE report (
      id   serial PRIMARY KEY,
      file text NOT NULL
    )
    """)
  end

  def create_log_table(id) do
    Repo.query("""
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
    """)
  end

  def drop_log_table(id) do
    Repo.query("DROP TABLE IF EXISTS log_#{id}")
  end
end
