const data = {...require("./base")}
const {pug} = require("./utils/functions")

;(() => {
	data.go_to_profile = "Vai al profilo"
	data.go_to_post = "Vai al post"
	data.go_username_or_url = "Nome utente o indirizzo URL"
	data.go_shortcode_or_url = "Codice breve o indirizzo URL"
	data.go_button = "Vai"
	data.about_bibliogram_header = "Informazioni su Bibliogram"
	data.pug_about_bibliogram_content = pug(`
		p.
			Bibliogram è un sito web che prende dati da profili pubblici di Instagram e li inserisce in una pagina
			intuitiva e leggera, permette di scaricare immagini, non sono presenti annunci pubblicitari,
			consente di generare feed RSS e non è necessario effettuare l'accesso.
			#[a(href=(link_to_featured_profiles ? "#featured-profiles" : "/u/instagram")).example-link Vedi un esempio.]
		p.
			Bibliogram #[em non] ti permette di postare anonimamente, mettere Mi piace, commentare, seguire o vedere profili privati.
			Non mantiene post eliminati.
	`)
	data.about_this_instance_header = "Informazioni su questa istanza"
	data.onion_site_available = "Onion site disponibile"
	data.t_settings = "Impostazioni"
	data.t_privacy_policy = "Informativa sulla privacy"
	data.has_not_written_privacy_policy = "Il proprietario non ha scritto l'informativa sulla privacy"
	data.instance_not_blocked = "L'istanza non è bloccata"
	data.instance_partially_blocked = "L'istanza è bloccata parzialmente"
	data.instance_blocked = "L'istanza è bloccata"
	data.rss_disabled = "Feed RSS non sono attivi"
	data.rss_enabled = "Feed RSS sono attivi"
	data.external_links_header = "Collegamenti esterni"
	data.source_link = "Codice su sourcehut"
	data.matrix_link = "Stanza di discussione su Matrix"
	data.instances_link = "Altre istanze di Bibliogram"
	data.contact_link = "Contatta lo sviluppatore"
	data.featured_profiles_header = "Profili in primo piano."
	data.featured_profiles_whats_this = "Che cos'è questo?"
	data.html_featured_profiles_disclaimer = pug(`
		p Il proprietario di questo sito web pensa personalmente che questi profili sono interessanti.
		p Questi non fanno parte del progetto Bibliogram.
	`)()
	data.verified_badge_title = "Verificato"
	data.verified_badge_alt = "Verificato."
	data.post_counter_label = "post"
	data.outgoing_follows_counter_label = "segue"
	data.incoming_follows_counter_label = "seguaci"
	data.t_home = "Home"
	data.tab_timeline = "Sequenza temporale"
	data.tab_igtv = "IGTV"
	data.next_page_button = "Pagina successiva"
	data.next_page_button_loading = "Caricamento..."
	data.profile_is_private_notice = "Il profilo è privato."
	data.no_posts_notice = "Nessun post."
	data.no_more_posts_notice = "Nessun ulteriore post."
	data.fn_page_divider = number => `Pagina ${number}`
	data.pug_post_timestamp = pug(`
		| Pubblicato il #[time(datetime=post.date.toISOString() data-local-date)= post.getDisplayDate()].
	`)
})()

module.exports = data
