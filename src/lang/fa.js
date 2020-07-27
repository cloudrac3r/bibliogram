const data = {...require("./base")}
const {pug} = require("./utils/functions")

;(() => {
	data.go_to_profile = "برو به نمایه"
	data.go_to_post = "برو به پست"
	data.go_username_or_url = "حساب کاربری یا لینک"
	data.go_shortcode_or_url = "کد کوتاه یا لینک"
	data.go_button = "برو"
	data.about_bibliogram_header = "درباره Bibliogram"
	data.pug_about_bibliogram_content = pug(`
		p.
			Bibliogram یک وبسایت است که اطلاعات نمایه های عمومی اینستاگرام را دریافت و آنرا در یک صفحه دوستانه و با بارگذاری سریع تر،
			تصاویر بارگیری پذیر، حذف تبلیغات ، ایجاد خوراک آر‌اس‌اس، و شما را ثبت نام اصرار نمیکند.
			#[a(href=(link_to_featured_profiles ? "#featured-profiles" : "/u/instagram")).example-link یک نمونه ببنید.]
		p.
			Bibliogram به شما اجازه نمیدهد تا پست های تا پست های ناشناس،  لایک ها، نظرات، دنبال کننده ها، یا نمایه های خصوصی را مشاهده کنید.
			این پست های حذف شده را نگه نمیدارد.
	`)
	data.about_this_instance_header = "مثال در این باره"
	data.onion_site_available = "سایت پیازی در دسترس است"
	data.t_settings = "تنظیمات"
	data.t_privacy_policy = "سیاست حفظ حریم خصوصی"
	data.has_not_written_privacy_policy = "مالک یک سیاست حفظ حریم خصوصی ننوشته است"
	data.instance_not_blocked = "به عنوان مثال مسدود نشده است"
	data.instance_partially_blocked = "به عنوان مثال تا حدی مسدود شده است"
	data.instance_blocked = "به عنوان مثال مسدود شده است"
	data.rss_disabled = "خوراک های آر‌اس‌اس غیرفعال شده اند"
	data.rss_enabled = "خوراک های آر‌اس‌اس فعال شده اند"
	data.external_links_header = "لینک های خارجی"
	data.source_link = "کد بر روی sourcehut"
	data.matrix_link = "اتاق گفتگو در ماتریکس"
	data.instances_link = "موارد دیگر Bibliogram"
	data.contact_link = "ارتباط با توسعه دهنده"
	data.featured_profiles_header = "نمایه های ویژه"
	data.featured_profiles_whats_this = "این چیست؟"
	data.html_featured_profiles_disclaimer = pug(`
		p مالک این وب سایت شخصا فکر می کند که این پروفایل ها جالب هستند.
		p آنها تاییدیه از جانب Bibliogram ندارند.
	`)()
	data.verified_badge_title = "تایید شده"
	data.verified_badge_alt = "تایید شده."
	data.post_counter_label = "پست ها"
	data.outgoing_follows_counter_label = "دنبال میکند"
	data.incoming_follows_counter_label = "دنبال شده توسط"
	data.t_home = "خانه"
	data.tab_timeline = "خط زمانی"
	data.tab_igtv = "آی‌جی تی‌وی"
	data.next_page_button = "صفحه بعدی"
	data.next_page_button_loading = "درحال‌بارگذاری..."
	data.profile_is_private_notice = "نمایه خصوصی است."
	data.no_posts_notice = "بدون پست."
	data.no_more_posts_notice = "بدون پست بیشتر"
	data.fn_page_divider = number => `صفحه ${number}`
	data.pug_post_timestamp = pug(`
		| پست شده در #[time(datetime=post.date.toISOString() data-local-date)= post.getDisplayDate()].
	`)
})()

module.exports = data
