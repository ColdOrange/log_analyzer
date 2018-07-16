use Mix.Config

config :log_analyzer, LogAnalyzer.Repo, adapter: Ecto.Adapters.Postgres

config :logger, level: :info

config :ua_inspector,
  database_path: "priv/ua_db"
