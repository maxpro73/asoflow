import fastify from "fastify"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const app = fastify({ logger: true })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

app.get("/users", async (_, reply) => {
  try {
    const { data, error } = await supabase.from("users").select("*")
    if (error) throw error
    reply.send({ success: true, data })
  } catch (e: any) {
    app.log.error(e)
    reply.status(500).send({ success: false, error: e.message })
  }
})

const start = async () => {
  try {
    await app.listen({ port: 3333, host: "0.0.0.0" })
    app.log.info(`🚀 Backend rodando → http://localhost:3333`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
