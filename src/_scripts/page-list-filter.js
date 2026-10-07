/**
 * Page list filter (replaces WET wb-tagfilter and wb-filter).
 *
 * - Reveals the filter controls (hidden without JavaScript, so the full list shows).
 * - Search: matches the text of each page entry.
 * - "Hide topic pages": keeps only entries tagged notLanding.
 * - Subject and topic checkboxes (local only): an entry matches if it has any checked tag.
 * - Updates one polite live region with "<shown> results out of <total>".
 */
(function () {
	const filters = document.getElementById("page-list-filters");
	if (!filters) return;

	const items = Array.from(document.querySelectorAll(".page-list-item"));
	const search = filters.querySelector('gcds-input[name="page-list-search"]');
	const hideTopics = document.getElementById("page-list-hide-topics");
	const tagFilters = Array.from(document.querySelectorAll(".page-list-tag-filter"));
	const count = filters.querySelector("[data-count]");
	const total = filters.querySelector("[data-total]");

	const index = items.map((item) => ({
		item,
		tags: item.dataset.tags.split(/\s+/).filter(Boolean),
		text: item.textContent.toLowerCase(),
	}));

	function asArray(value) {
		if (Array.isArray(value)) return value;
		if (typeof value === "string" && value.trim().startsWith("[")) {
			try {
				return JSON.parse(value);
			} catch (e) {
				return [];
			}
		}
		return value ? [value] : [];
	}

	function apply() {
		const query = ((search && search.value) || "").trim().toLowerCase();
		const topicsHidden = asArray(hideTopics && hideTopics.value).includes("notLanding");
		const selected = tagFilters.flatMap((el) => asArray(el.value));

		let shown = 0;
		index.forEach(({ item, tags, text }) => {
			const visible =
				(!topicsHidden || tags.includes("notLanding")) &&
				(selected.length === 0 || selected.some((tag) => tags.includes(tag))) &&
				(query === "" || text.includes(query));
			item.hidden = !visible;
			if (visible) shown++;
		});

		count.textContent = shown;
		total.textContent = items.length;
	}

	["gcdsInput", "gcdsChange", "input", "change"].forEach((type) =>
		filters.addEventListener(type, apply)
	);

	const ready = Array.from(filters.querySelectorAll("*"))
		.filter((el) => el.tagName.startsWith("GCDS-") && el.componentOnReady)
		.map((el) => el.componentOnReady());

	Promise.all(ready).then(() => {
		filters.hidden = false;
		apply();
	});
})();
