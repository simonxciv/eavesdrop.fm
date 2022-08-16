<div>
	<slot />
</div>

<style lang="scss">
	div {
		border-radius: 0.5rem;
		border: 3px solid hsl(0, 84%, 90%);
		background: var(--background);
		white-space: nowrap;
		overflow-x: scroll;
		padding: 0.4rem;
		width: 100%;
		font-size: 1rem;
		outline: 0;
		user-select: all;
		margin-top: 0.8rem;
	}
</style>
