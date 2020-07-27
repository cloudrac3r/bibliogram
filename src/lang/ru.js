const data = {...require("./base")}
const {pug} = require("./utils/functions")

;(() => {
	data.meta_direction = "ltr"

	data.go_to_profile = "Перейти в профиль"
	data.go_to_post = "Перейти в публикацию"
	data.go_username_or_url = "Имя пользователя или URL"
	data.go_shortcode_or_url = "Короткий код или URL"
	data.go_button = "Перейти"
	data.about_bibliogram_header = "О Bibliogram"
	data.pug_about_bibliogram_content = pug(`
		p.
			Bibliogram - это сайт, который собирает данные из открытых профилей Instagram и показывает их
			на удобной странице, которая загружается быстрее, дает возможность сохранять изображения, убирает рекламу,
			создает каналы RSS и не заставляет вас заходить в Instagram. #[a(href=(link_to_featured_profiles ? "#featured-profiles" : "/u/instagram")).example-link Смотрите пример.]
		p.
			Bibliogram НЕ позволяет анонимно создавать публикации, оставлять лайки, комментарии, подписываться или смотреть закрытые профили.
			Он не хранит удаленные публикации.
	`)
	data.about_this_instance_header = "Об этом сервере"
	data.onion_site_available = "Доступен сайт Onion"
	data.t_settings = "Настройки"
	data.t_privacy_policy = "Политика конфиденциальности"
	data.has_not_written_privacy_policy = "Владелец не составил политику конфиденциальности"
	data.instance_not_blocked = "Сервер не заблокирован"
	data.instance_partially_blocked = "Сервер частично заблокирован"
	data.instance_blocked = "Сервер заблокирован"
	data.rss_disabled = "Каналы RSS отключены"
	data.rss_enabled = "Каналы RSS включены"
	data.external_links_header = "Внешние ссылки"
	data.source_link = "Исходный код на sourcehut"
	data.matrix_link = "Комната обсуждения на Matrix"
	data.instances_link = "Другие сервера Bibliogram"
	data.contact_link = "Связаться с разработчиком"
	data.featured_profiles_header = "Избранные профили"
	data.featured_profiles_whats_this = "Что это?"
	data.html_featured_profiles_disclaimer = pug(`
		p Владелец данного сайта считает данные профили интересными.
		p Они никак не связаны с проектом Bibliogram.
	`)()
	data.verified_badge_title = "Подтвержденный"
	data.verified_badge_alt = "Подтвержденный."
	data.post_counter_label = "публикаций"
	data.outgoing_follows_counter_label = "подписок"
	data.incoming_follows_counter_label = "подписчиков"
	data.t_home = "Домой"
	data.tab_timeline = "История"
	data.tab_igtv = "IGTV"
	data.next_page_button = "Следующая страница"
	data.next_page_button_loading = "Загрузка..."
	data.profile_is_private_notice = "Это закрытый профиль."
	data.no_posts_notice = "Нет публикаций."
	data.no_more_posts_notice = "Публикаций больше нет."
	data.fn_page_divider = number => `Страница ${number}`
	data.pug_post_timestamp = pug(`
		| Опубликовано #[time(datetime=post.date.toISOString() data-local-date)= post.getDisplayDate()].
	`)
})()

module.exports = data
