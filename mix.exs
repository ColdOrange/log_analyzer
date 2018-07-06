defmodule LogAnalyzer.MixProject do
  use Mix.Project

  def project do
    [
      app: :log_analyzer,
      version: "0.1.0",
      elixir: "~> 1.6",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      mod: {LogAnalyzer, []},
      extra_applications: [
        :logger,
        :cowboy,
        :plug,
        :ua_inspector
      ]
    ]
  end

  defp deps do
    [
      {:poison, "~> 3.1"},
      {:timex, "~> 3.1"},
      {:postgrex, "~> 0.13"},
      {:ecto, "~> 2.1"},
      {:cowboy, "~> 2.0"},
      {:plug, "~> 1.6"},
      {:ua_inspector, "~> 0.17"}
    ]
  end
end
