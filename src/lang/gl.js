const data = {...require("./base")}
const {pug} = require("./utils/functions")

;(() => {
	data.meta_direction = "ltr"

	data.go_to_profile = "Ir ó perfil"
	data.go_to_post = "Ir á publicación"
	data.go_username_or_url = "Usuaria ou URL"
	data.go_shortcode_or_url = "Código ou URL"
	data.go_button = "Ir"
	data.about_bibliogram_header = "Acerca de Bibliogram"
	data.pug_about_bibliogram_content = pug(`
		p.
			Bibliogram é un sitio web que obtén contidos dos perfís públicos de Instagram e preséntachos nun formato
			máis amigable e que carga máis rápido, permite descargar imaxes, elimina anuncios,
			crea fontes RSS, e non insiste en que te rexistres. #[a(href=(link_to_featured_profiles ? "#featured-profiles" : "/u/instagram")).example-link Ver un exemplo.]
		p.
			Bibliogram #[em non] permite publicar de xeito anónimo nin gustar, comentar, seguir ou ver pefís privados.
			Non garda as publicacións eliminadas.
	`)
	data.about_this_instance_header = "Acerca desta instancia"
	data.onion_site_available = "Enderezo Onion dispoñible"
	data.t_settings = "Axustes"
	data.t_privacy_policy = "Política de privacidade"
	data.has_not_written_privacy_policy = "Non foi publicada unha política de privacidade"
	data.instance_not_blocked = "Instancia non bloqueada"
	data.instance_partially_blocked = "Instancia parcialmente bloqueada"
	data.instance_blocked = "Instancia bloqueada"
	data.rss_disabled = "Fontes RSS desactivadas"
	data.rss_enabled = "Fontes RSS activadas"
	data.external_links_header = "Ligazóns externas"
	data.source_link = "Código en sourcehut"
	data.matrix_link = "Sala de conversa en Matrix"
	data.instances_link = "Outras instancias de Bibliogram"
	data.contact_link = "Contacta coas desenvolvedoras"
	data.featured_profiles_header = "Perfís destacados"
	data.featured_profiles_whats_this = "¿Que é isto?"
	data.html_featured_profiles_disclaimer = pug(`
		p O dono deste sitio web pensa que estes perfís pódenche interesar.
		p Non son recomendacións do proxecto Bibliogram.
	`)()
	data.verified_badge_title = "Verificado"
	data.verified_badge_alt = "Verificado."
	data.post_counter_label = "publicacións"
	data.outgoing_follows_counter_label = "seguindo"
	data.incoming_follows_counter_label = "seguido por"
	data.t_home = "Inicio"
	data.tab_timeline = "Cronoloxía"
	data.tab_igtv = "IGTV"
	data.next_page_button = "Seguinte"
	data.next_page_button_loading = "Cargando..."
	data.profile_is_private_notice = "Perfil privado."
	data.no_posts_notice = "Sen publicacións."
	data.no_more_posts_notice = "Non hai máis publicacións."
	data.fn_page_divider = number => `Páxina ${number}`
	data.pug_post_timestamp = pug(`
		| Publicado o #[time(datetime=post.date.toISOString() data-local-date)= post.getDisplayDate()].
	`)
})()

module.exports = data
