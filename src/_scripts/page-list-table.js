/**
 * Page list table (replaces WET wb-tables and wb-tagfilter on the page list table).
 *
 * gcds-table provides the keyword filter, sorting and pagination. This script
 * applies the "Visible columns" and page-type checkboxes from the options dialog
 * and reveals the dialog buttons once the components are ready.
 *
 * gcds-table 1.6.0 does not re-render when its columns or data change after the
 * first render, so the table is rebuilt with the new attributes instead.
 * Revisit when GCDS supports updating them in place.
 */
(function () {
	let table = document.getElementById("page-list-table");
	if (!table) return;

	const allColumns = JSON.parse(table.getAttribute("columns"));
	const allRows = JSON.parse(table.getAttribute("data"));
	const baseAttributes = Array.from(table.attributes).filter(
		(attr) => !["columns", "data", "class"].includes(attr.name)
	);
	const slotTemplates = Array.from(table.children)
		.filter((el) => el.tagName === "TEMPLATE" || el.getAttribute("slot") === "caption")
		.map((el) => el.cloneNode(true));

	const columnChoice = document.getElementById("page-list-table-columns");
	const typeChoice = document.getElementById("page-list-table-types");
	const controls = document.getElementById("page-list-table-controls");

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
		const fields = asArray(columnChoice && columnChoice.value);
		const types = asArray(typeChoice && typeChoice.value);

		// Keep the title column so every row stays identifiable.
		const columns = allColumns.filter((c) => c.field === "title" || fields.includes(c.field));
		const rows = allRows.filter((r) => types.includes(r.pageType));

		const next = document.createElement("gcds-table");
		baseAttributes.forEach((attr) => next.setAttribute(attr.name, attr.value));
		next.setAttribute("columns", JSON.stringify(columns));
		next.setAttribute("data", JSON.stringify(rows));
		slotTemplates.forEach((el) => next.appendChild(el.cloneNode(true)));

		table.replaceWith(next);
		table = next;
	}

	[columnChoice, typeChoice].forEach((el) => {
		if (!el) return;
		el.addEventListener("gcdsChange", apply);
	});

	const ready = Array.from(document.querySelectorAll("gcds-table, gcds-checkboxes, gcds-button"))
		.filter((el) => el.componentOnReady)
		.map((el) => el.componentOnReady());

	Promise.all(ready).then(() => {
		if (controls) controls.hidden = false;
	});
})();
