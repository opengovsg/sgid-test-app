import { createApp } from './app'
import { PORT } from './config'

const app = createApp()

app.listen(PORT, () => console.log(`listening on port ${PORT}`))
