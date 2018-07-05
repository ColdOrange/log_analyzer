defmodule LogAnalyzer.Analyzer do
  def analyze() do
    LogAnalyzer.RepoSupervisor.start_repo(
      %LogAnalyzer.DBConfig{
        driver: "postgresql",
        database: "log_analyzer",
        username: "Orange",
        password: ""
      },
      true
    )
  end
end
