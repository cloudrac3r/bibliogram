const data = {...require("./base")}
const {pug} = require("./utils/functions")

;(() => {
	data.meta_direction = "rtl"

	data.go_to_profile = "برو به نمایه"
	data.go_to_post = "برو به پست"
	data.go_username_or_url = "حساب کاربری یا نشانی"
	data.go_shortcode_or_url = "کد کوتاه یا نشانی"
	data.go_button = "برو"
	data.about_bibliogram_header = "درباره Bibliogram"
	data.pug_about_bibliogram_content = pug(`
		p.
			بیبلیوگرام (Bibliogram) وبسایتی است که اطلاعات نمایه‌های عمومی اینستاگرام را دریافت و آن‌ها در صفحه‌ای کاربرپسندتر با
			قابلیت بارگذاری سریع‌تر، تصاویر قابل بارگیری و حذف تبلیغات، ایجاد خوراک آر‌اس‌اس، و بدون نیاز به ثبت‌نام نمایش می‌دهد.
			#[a(href=(link_to_featured_profiles ? "#featured-profiles" : "/u/instagram")).example-link یک نمونه ببنید.]
		p.
			بیبلیوگرام (Bibliogram) به شما این امکان را نمی‌دهد تا بتوانید به صورت ناشناس اقدام به انتشار محتوا کرده
			یا محتوای دیگران را بپسندید، زیرشان نظر دهید، حساب دیگران را دنبال کنید و یا نمایه‌های خصوصی را ببینید. بیبلیوگرام
			محتوای پاک شده را نیز حذف نمی‌کند.
	`)
	data.about_this_instance_header = "دربارهٔ این نمونه"
	data.onion_site_available = "سایت پیازی در دسترس است"
	data.t_settings = "تنظیمات"
	data.t_privacy_policy = "سیاست حفظ حریم خصوصی"
	data.has_not_written_privacy_policy = "مالک، سیاست حفظ حریم خصوصی ننوشته است"
	data.instance_not_blocked = "نمونه مسدود نشده است"
	data.instance_partially_blocked = "نمونه به صورت جزئی مسدود شده است"
	data.instance_blocked = "نمونه مسدود شده است"
	data.rss_disabled = "خوراک‌های آر‌اس‌اس غیرفعال شده‌اند"
	data.rss_enabled = "خوراک های آر‌اس‌اس فعال شده‌اند"
	data.external_links_header = "پیوندهای خارجی"
	data.source_link = "کد بر روی sourcehut"
	data.matrix_link = "اتاق گفتگو در ماتریکس"
	data.instances_link = "نمونه‌های دیگر بیبلیوگرام"
	data.contact_link = "ارتباط با توسعه‌دهنده"
	data.featured_profiles_header = "نمایه‌های ویژه"
	data.featured_profiles_whats_this = "این چیست؟"
	data.html_featured_profiles_disclaimer = pug(`
		p مالک این نمونه شخصا فکر می‌کند که این نمایه‌ها جالب هستند.
		p آن‌ها تاییدیه از جانب بیبلیوگرام ندارند.
	`)()
	data.verified_badge_title = "تایید شده"
	data.verified_badge_alt = "تایید شده."
	data.post_counter_label = "پست"
	data.outgoing_follows_counter_label = "پی‌گرفته"
	data.incoming_follows_counter_label = "پی‌گیر"
	data.t_home = "خانه"
	data.tab_timeline = "خط زمانی"
	data.tab_igtv = "آی‌جی‌تی‌وی"
	data.next_page_button = "صفحه بعدی"
	data.next_page_button_loading = "درحال‌بارگذاری..."
	data.profile_is_private_notice = "این نمایه خصوصی است."
	data.no_posts_notice = "بدون پست."
	data.no_more_posts_notice = "بدون پست بیشتر"
	data.fn_page_divider = number => `صفحه ${number}`
	data.pug_post_timestamp = pug(`
		| منتشر شده در #[time(datetime=post.date.toISOString() data-local-date)= post.getDisplayDate()].
	`)
})()

module.exports = data
