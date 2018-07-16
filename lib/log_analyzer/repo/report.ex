defmodule LogAnalyzer.Repo.Report do
  use Ecto.Schema

  schema "report" do
    field :file, :string
  end
end
