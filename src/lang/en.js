const data = {...require("./base")}
const {pug} = require("./utils/functions")

;(() => {
	data.meta_direction = "ltr"

	data.go_to_profile = "Go to profile"
	data.go_to_post = "Go to post"
	data.go_username_or_url = "Username or URL"
	data.go_shortcode_or_url = "Shortcode or URL"
	data.go_button = "Go"
	data.about_bibliogram_header = "About Bibliogram"
	data.pug_about_bibliogram_content = pug(`
		p.
			Bibliogram is a website that takes data from Instagram's public profile views and puts it into
			a friendlier page that loads faster, gives downloadable images, eliminates ads,
			generates RSS feeds, and doesn't urge you to sign up. #[a(href=(link_to_featured_profiles ? "#featured-profiles" : "/u/instagram")).example-link See an example.]
		p.
			Bibliogram does #[em not] allow you to anonymously post, like, comment, follow, or view private profiles.
			It does not preserve deleted posts.
	`)
	data.about_this_instance_header = "About this instance"
	data.onion_site_available = "Onion site available"
	data.t_settings = "Settings"
	data.t_privacy_policy = "Privacy policy"
	data.has_not_written_privacy_policy = "Owner has not written a privacy policy"
	data.instance_not_blocked = "Instance is not blocked"
	data.instance_partially_blocked = "Instance is partially blocked"
	data.instance_blocked = "Instance is blocked"
	data.rss_disabled = "RSS feeds are disabled"
	data.rss_enabled = "RSS feeds are enabled"
	data.external_links_header = "External links"
	data.source_link = "Code on sourcehut"
	data.matrix_link = "Discussion room on Matrix"
	data.instances_link = "Other Bibliogram instances"
	data.contact_link = "Contact the developer"
	data.featured_profiles_header = "Featured profiles"
	data.featured_profiles_whats_this = "What's this?"
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
