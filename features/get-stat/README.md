InquirerJS가 ESM이라 어쩔수 없이 webpack 사용.

npm exec webpack -- --config features\get-stat\webpack.config.js

혹은, 바로 실행 하고 싶을시

npm exec webpack -- --config features\get-stat\webpack.config.js && node features\get-stat\dist\main.js