defmodule LogAnalyzer.Server do
  def child_spec(opts) do
    Plug.Adapters.Cowboy2.child_spec(
      scheme: :http,
      plug: LogAnalyzer.Server.Router,
      options: opts
    )
  end
end
