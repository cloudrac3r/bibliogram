const data = {...require("./base")}
const {pug} = require("./utils/functions")

;(() => {
	data.meta_direction = "ltr"

	data.go_to_profile = "Ir al perfil"
	data.go_to_post = "Ir a la publicación"
	data.go_username_or_url = "Usuario o URL"
	data.go_shortcode_or_url = "Código corto o URL"
	data.go_button = "Ir"
	data.about_bibliogram_header = "Acerca de Bibliogram"
	data.pug_about_bibliogram_content = pug(`
		p.
			Bibliogram es un sitio web que toma datos de las vistas de perfiles públicos de Instagram y los pone en
			una página más amigable que carga más rápido, ofrece imágenes descargables, elimina anuncios,
			genera feeds RSS y no te urge a darte de alta. #[a(href=(link_to_featured_profiles ? "#featured-profiles" : "/u/instagram")).example-link Ver un ejemplo.]
		p.
			Bibliogram #[em no] sirve para publicar anónimamente, dar a me gusta, comentar, seguir o ver perfiles privados.
			No preserva publicaciones borradas.
	`)
	data.about_this_instance_header = "Acerca de este nodo"
	data.onion_site_available = "Sitio onion disponible"
	data.t_settings = "Ajustes"
	data.t_privacy_policy = "Política de privacidad"
	data.has_not_written_privacy_policy = "El propietario no ha escrito una política de privacidad"
	data.instance_not_blocked = "El nodo no está bloqueado"
	data.instance_partially_blocked = "El nodo está parcialmente bloqueado"
	data.instance_blocked = "El nodo está bloqueado"
	data.rss_disabled = "Los feeds RSS están deshabilitados"
	data.rss_enabled = "Los feeds RSS están habilitados"
	data.external_links_header = "Enlaces externos"
	data.source_link = "Código en sourcehut"
	data.matrix_link = "Sala de debate en Matrix"
	data.instances_link = "Otros nodos de Bibliogram"
	data.contact_link = "Contactar con el desarrollador"
	data.featured_profiles_header = "Perfiles destacados"
	data.featured_profiles_whats_this = "¿Qué; es esto?"
	data.html_featured_profiles_disclaimer = pug(`
		p El propietario de este sitio web piensa que estos perfiles son interesantes.
		p Estos no est&an respaldados por el proyecto Bibliogram.
	`)()
	data.verified_badge_title = "Verificado"
	data.verified_badge_alt = "Verificado."
	data.post_counter_label = "publicaciones"
	data.outgoing_follows_counter_label = "siguiendo"
	data.incoming_follows_counter_label = "seguido por"
	data.t_home = "Inicio"
	data.tab_timeline = "Linea temporal"
	data.tab_igtv = "IGTV"
	data.next_page_button = "Siguiente página"
	data.next_page_button_loading = "Cargando..."
	data.profile_is_private_notice = "El perfil es privado."
	data.no_posts_notice = "No hay publicaciones."
	data.no_more_posts_notice = "No hay más publicaciones."
	data.fn_page_divider = number => `Página ${number}`
	data.pug_post_timestamp = pug(`
		| Publicado el #[time(datetime=post.date.toISOString() data-local-date)= post.getDisplayDate()].
	`)
})()

module.exports = data
