use Mix.Config

config :log_analyzer, LogAnalyzer.Repo, adapter: Ecto.Adapters.Postgres

config :ua_inspector,
  database_path: "priv/ua_db"
