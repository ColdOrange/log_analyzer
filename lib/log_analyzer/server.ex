defmodule LogAnalyzer.Server do
  alias LogAnalyzer.{DBConfig, LogConfig, Parser}
  alias LogAnalyzer.Repo.Supervisor, as: RepoSupervisor

  def run() do
    RepoSupervisor.start_repo(
      %DBConfig{
        driver: "postgres",
        database: "log_analyzer",
        username: "Orange",
        password: ""
      },
      false
    )

    Parser.parse(LogConfig.get())
  end
end
