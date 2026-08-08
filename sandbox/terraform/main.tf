terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

resource "local_file" "test" {
  filename = "${path.module}/test.txt"
  content  = "CaelumOS test content!"
}
