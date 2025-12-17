export function LandingContact() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30" id="contact">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-foreground tracking-tight text-3xl font-bold leading-tight md:text-4xl">
              Fale Conosco
            </h2>
            <p className="text-muted-foreground text-base font-normal leading-normal">
              Tem alguma dúvida ou precisa de um plano personalizado? Envie uma mensagem e nossa equipe entrará em contato em breve.
            </p>
          </div>
          <form className="w-full space-y-4">
            <div>
              <label className="sr-only" htmlFor="name">Nome</label>
              <input 
                className="w-full rounded-lg border-border bg-card p-3 text-sm focus:border-primary focus:ring-primary text-foreground" 
                id="name" 
                placeholder="Nome" 
                type="text"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="email">Email</label>
              <input 
                className="w-full rounded-lg border-border bg-card p-3 text-sm focus:border-primary focus:ring-primary text-foreground" 
                id="email" 
                placeholder="Email" 
                type="email"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="subject">Assunto</label>
              <input 
                className="w-full rounded-lg border-border bg-card p-3 text-sm focus:border-primary focus:ring-primary text-foreground" 
                id="subject" 
                placeholder="Assunto" 
                type="text"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="message">Mensagem</label>
              <textarea 
                className="w-full rounded-lg border-border bg-card p-3 text-sm focus:border-primary focus:ring-primary text-foreground" 
                id="message" 
                placeholder="Mensagem" 
                rows={4}
              />
            </div>
            <button 
              className="w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold leading-normal tracking-[0.015em] transition-colors" 
              type="submit"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}