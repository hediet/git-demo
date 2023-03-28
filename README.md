# git-demo harmless change
Git Demo

```plantuml
@startuml Main

[data-extraction] 
[webview]
[extension]
[visualization]
[visualization-playground]

[webview] ..> [extension]: "Uses RPC contracts, connects using websockets"
[extension] ..> [webview]: "Loads into a Webview in VS Code"

[webview] ..> [visualization]: "Uses React Components"

[visualization-playground] ..> [visualization]: "Uses React Components"

[extension] ..> [data-extraction]: "Injects Runtime into JavaScript applications"

[webview] ..> [data-extraction]: "Uses common types"

@enduml
```
