defmodule LogAnalyzer.DBConfigTest do
  use ExUnit.Case
  alias LogAnalyzer.DBConfig

  test "get DBConfig" do
    assert DBConfig.get() == %DBConfig{}
  end
end
