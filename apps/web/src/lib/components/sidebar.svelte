<script lang="ts">
	import { page } from '$app/state';
	import { House, Layers, Menu, X } from '@lucide/svelte';

	const navItems = [
		{
			label: 'Scheduling',
			url: '/scheduling'
		},
		{
			label: 'Time Off',
			url: '/timeoff'
		},
		{
			label: 'Users',
			url: '/users'
		},
		{
			label: 'Territories',
			url: '/territories'
		}
	];
</script>

<!-- Mobile -->
<el-dialog>
	<dialog id="sidebar" class="backdrop:bg-transparent lg:hidden">
		<el-dialog-backdrop
			class="data-closed:opacity-0 fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear"
		>
		</el-dialog-backdrop>
		<div tabindex="-1" class="fixed inset-0 flex focus:outline-none">
			<el-dialog-panel
				class="group/dialog-panel data-closed:-translate-x-full relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out"
			>
				<div
					class="group-data-closed/dialog-panel:opacity-0 absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out"
				>
					<button type="button" command="close" commandfor="sidebar" class="-m-2.5 p-2.5">
						<span class="sr-only">Close sidebar</span>
						<X
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							data-slot="icon"
							aria-hidden="true"
							class="size-6 text-white"
						/>
					</button>
				</div>
				<div
					class="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 dark:bg-gray-900 dark:ring dark:ring-white/10 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-black/10"
				>
					<nav class="relative mt-4 flex flex-1 flex-col">
						<ul role="list" class="flex flex-1 flex-col gap-y-7">
							<li>
								<ul role="list" class="-mx-2 space-y-1">
									<li>
										<!-- Current: "bg-gray-50 dark:bg-white/5 text-indigo-600 dark:text-white", Default: "text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5" -->
										<a
											href="/"
											class="group flex gap-x-3 rounded-md bg-gray-50 p-2 text-sm/6 font-semibold text-indigo-600 dark:bg-white/5 dark:text-white"
										>
											<House
												fill="none"
												stroke="currentColor"
												stroke-width="1.5"
												data-slot="icon"
												aria-hidden="true"
												class="size-6 shrink-0 text-indigo-600 dark:text-white"
											/>
											Dashboard
										</a>
									</li>
									{#each navItems as navItem}
										<li>
											<a
												href={navItem.url}
												class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
											>
												<Layers
													fill="none"
													stroke="currentColor"
													stroke-width="1.5"
													data-slot="icon"
													aria-hidden="true"
													class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white"
												/>
												{navItem.label}
											</a>
										</li>
									{/each}
								</ul>
							</li>
						</ul>
					</nav>
				</div>
			</el-dialog-panel>
		</div>
	</dialog>
</el-dialog>
<!-- Desktop -->
<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-56 lg:flex-col dark:bg-gray-900">
	<div
		class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 dark:border-white/10 dark:bg-black/10"
	>
		<nav class="mt-4 flex flex-1 flex-col">
			<ul role="list" class="flex flex-1 flex-col gap-y-7">
				<li>
					<ul role="list" class="flex flex-1 flex-col gap-y-7">
						<li>
							<ul role="list" class="-mx-2 space-y-1">
								<li>
									<!-- Current: "bg-gray-50 dark:bg-white/5 text-indigo-600 dark:text-white", Default: "text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5" -->
									<a
										href="/"
										class="group flex gap-x-3 rounded-md bg-gray-50 p-2 text-sm/6 font-semibold text-indigo-600 dark:bg-white/5 dark:text-white"
									>
										<House
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											data-slot="icon"
											aria-hidden="true"
											class="size-6 shrink-0 text-indigo-600 dark:text-white"
										/>
										Dashboard
									</a>
								</li>
								{#each navItems as navItem}
									<li>
										<a
											href={navItem.url}
											class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
										>
											<Layers
												fill="none"
												stroke="currentColor"
												stroke-width="1.5"
												data-slot="icon"
												aria-hidden="true"
												class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white"
											/>
											{navItem.label}
										</a>
									</li>
								{/each}
							</ul>
						</li>
					</ul>
				</li>
				<li class="-mx-6 mt-auto">
					<a
						href="/profile"
						class="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
					>
						<img
							src={page.data.user.image}
							alt=""
							class="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
						/>
						<span class="sr-only">Your profile</span>
						<span aria-hidden="true">{page.data.user.name}</span>
					</a>
				</li>
			</ul>
		</nav>
	</div>
</div>
<!-- Opener -->
<div
	class="shadow-xs sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 sm:px-6 lg:hidden dark:bg-gray-900 dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:border-b dark:after:border-white/10 dark:after:bg-black/10"
>
	<button
		type="button"
		command="show-modal"
		commandfor="sidebar"
		class="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:text-white"
	>
		<span class="sr-only">Open sidebar</span>
		<Menu
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			data-slot="icon"
			aria-hidden="true"
			class="size-6"
		/>
	</button>
	<!-- <div class="flex-1 text-sm/6 font-semibold text-gray-900 dark:text-white">page title</div> -->
	<a href="/profile">
		<span class="sr-only">Your profile</span>
		<img
			src={page.data.user.image}
			alt=""
			class="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
		/>
	</a>
</div>
