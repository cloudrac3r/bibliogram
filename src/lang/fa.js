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
			Bibliogram does #[em not] allow you to anonymously post, like, comment, follow, or view private profiles.
			It does not preserve deleted posts.
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
		p The owner of this website personally thinks that these profiles are interesting.
		p These are not endorsements from the Bibliogram project.
	`)()
	data.verified_badge_title = "Verified"
	data.verified_badge_alt = "Verified."
	data.post_counter_label = "posts"
	data.outgoing_follows_counter_label = "following"
	data.incoming_follows_counter_label = "followed by"
	data.t_home = "Home"
	data.tab_timeline = "Timeline"
	data.tab_igtv = "IGTV"
	data.next_page_button = "Next page"
	data.next_page_button_loading = "Loading..."
	data.profile_is_private_notice = "Profile is private."
	data.no_posts_notice = "No posts."
	data.no_more_posts_notice = "No more posts."
	data.fn_page_divider = number => `Page ${number}`
	data.pug_post_timestamp = pug(`
		| Posted on #[time(datetime=post.date.toISOString() data-local-date)= post.getDisplayDate()].
	`)
})()

module.exports = data
