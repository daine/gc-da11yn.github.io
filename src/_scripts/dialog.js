/**
 * Dialog behaviour for macros/dialog.njk (temporary, until GCDS releases its modal dialog).
 *
 * - [data-dialog-open="<id>"] opens the dialog with that id as a modal.
 * - [data-dialog-close] closes the dialog it is in.
 * - Clicking the backdrop closes the dialog. Escape is handled natively.
 * - Focus returns to the button that opened the dialog.
 */
(function () {
	let opener = null;

	document.addEventListener("click", (event) => {
		const openButton = event.target.closest("[data-dialog-open]");
		if (openButton) {
			const dialog = document.getElementById(openButton.dataset.dialogOpen);
			if (dialog && typeof dialog.showModal === "function" && !dialog.open) {
				opener = openButton;
				dialog.showModal();
			}
			return;
		}

		const closeButton = event.target.closest("[data-dialog-close]");
		if (closeButton) {
			closeButton.closest("dialog")?.close();
			return;
		}

		if (event.target instanceof HTMLDialogElement && event.target.classList.contains("site-dialog")) {
			const rect = event.target.getBoundingClientRect();
			const inside =
				event.clientX >= rect.left && event.clientX <= rect.right &&
				event.clientY >= rect.top && event.clientY <= rect.bottom;
			if (!inside) event.target.close();
		}
	});

	document.addEventListener(
		"close",
		(event) => {
			if (event.target.classList?.contains("site-dialog") && opener) {
				const target = opener.shadowRoot?.querySelector("button, a") || opener;
				target.focus();
				opener = null;
			}
		},
		true
	);
})();
