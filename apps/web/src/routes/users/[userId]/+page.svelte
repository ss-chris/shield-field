<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	$inspect(data);
</script>

<div class="mb-4">
	<div>
		<nav aria-label="Back" class="sm:hidden">
			<a
				href="#"
				class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
			>
				<svg
					viewBox="0 0 20 20"
					fill="currentColor"
					data-slot="icon"
					aria-hidden="true"
					class="-ml-1 mr-1 size-5 shrink-0 text-gray-400 dark:text-gray-500"
				>
					<path
						d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
						clip-rule="evenodd"
						fill-rule="evenodd"
					/>
				</svg>
				Back
			</a>
		</nav>
		<nav aria-label="Breadcrumb" class="hidden sm:flex">
			<ol role="list" class="flex items-center space-x-4">
				<li>
					<div class="flex">
						<a
							href="/users"
							class="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							>Users</a
						>
					</div>
				</li>
				<li>
					<div class="flex items-center">
						<svg
							viewBox="0 0 20 20"
							fill="currentColor"
							data-slot="icon"
							aria-hidden="true"
							class="size-5 shrink-0 text-gray-400 dark:text-gray-500"
						>
							<path
								d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
								clip-rule="evenodd"
								fill-rule="evenodd"
							/>
						</svg>
						<a
							href="#"
							aria-current="page"
							class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							>User</a
						>
					</div>
				</li>
			</ol>
		</nav>
	</div>
	<div class="mt-2 md:flex md:items-center md:justify-between">
		<div class="min-w-0 flex-1">
			<h2
				class="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white"
			>
				{data.profile.name}
			</h2>
		</div>
	</div>
</div>

<div>
	<div class="grid grid-cols-1 sm:hidden">
		<!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
		<select
			aria-label="Select a tab"
			class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-gray-100 dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
		>
			<option selected>User Details</option>
			<option>Scheduling</option>
			<option>Permissions</option>
		</select>
		<svg
			viewBox="0 0 16 16"
			fill="currentColor"
			data-slot="icon"
			aria-hidden="true"
			class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500 dark:fill-gray-400"
		>
			<path
				d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
				clip-rule="evenodd"
				fill-rule="evenodd"
			/>
		</svg>
	</div>
	<div class="hidden sm:block">
		<div class="border-b border-gray-200 dark:border-white/10">
			<nav aria-label="Tabs" class="-mb-px flex space-x-8">
				<a
					href="#"
					class="group inline-flex items-center border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
				>
					<svg
						viewBox="0 0 20 20"
						fill="currentColor"
						data-slot="icon"
						aria-hidden="true"
						class="-ml-0.5 mr-2 size-5 text-indigo-500 dark:text-indigo-400"
					>
						<path
							d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
						/>
					</svg>
					<span>User Details</span>
				</a>
				<a
					href="#"
					class="group inline-flex items-center border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-300"
				>
					<svg
						viewBox="0 0 20 20"
						fill="currentColor"
						data-slot="icon"
						aria-hidden="true"
						class="-ml-0.5 mr-2 size-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
					>
						<path
							d="M4 16.5v-13h-.25a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H16v13h.25a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5H4Zm3-11a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM11 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm.5 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z"
							clip-rule="evenodd"
							fill-rule="evenodd"
						/>
					</svg>
					<span>Scheduling</span>
				</a>
				<a
					href="#"
					aria-current="page"
					class="group inline-flex items-center border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-300"
				>
					<svg
						viewBox="0 0 20 20"
						fill="currentColor"
						data-slot="icon"
						aria-hidden="true"
						class="-ml-0.5 mr-2 size-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
					>
						<path
							d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z"
						/>
					</svg>
					<span>Permissions</span>
				</a>
			</nav>
		</div>
	</div>
</div>

<div class="pt-2">
	<form>
		<div class="space-y-12">
			<div class="border-b border-white/10 pb-12">
				<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
					<div class="sm:col-span-4">
						<label for="username" class="block text-sm/6 font-medium text-white">Username</label>
						<div class="mt-2">
							<div
								class="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500"
							>
								<div class="shrink-0 select-none text-base text-gray-400 sm:text-sm/6">
									workcation.com/
								</div>
								<input
									id="username"
									type="text"
									name="username"
									placeholder="janesmith"
									class="block min-w-0 grow bg-transparent py-1.5 pl-1 pr-3 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
								/>
							</div>
						</div>
					</div>

					<div class="col-span-full">
						<label for="about" class="block text-sm/6 font-medium text-white">About</label>
						<div class="mt-2">
							<textarea
								id="about"
								name="about"
								rows="3"
								class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
							></textarea>
						</div>
						<p class="mt-3 text-sm/6 text-gray-400">Write a few sentences about yourself.</p>
					</div>

					<div class="col-span-full">
						<label for="photo" class="block text-sm/6 font-medium text-white">Photo</label>
						<div class="mt-2 flex items-center gap-x-3">
							<svg
								viewBox="0 0 24 24"
								fill="currentColor"
								data-slot="icon"
								aria-hidden="true"
								class="size-12 text-gray-500"
							>
								<path
									d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
									clip-rule="evenodd"
									fill-rule="evenodd"
								/>
							</svg>
							<button
								type="button"
								class="inset-ring inset-ring-white/5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
								>Change</button
							>
						</div>
					</div>

					<div class="col-span-full">
						<label for="cover-photo" class="block text-sm/6 font-medium text-white"
							>Cover photo</label
						>
						<div
							class="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10"
						>
							<div class="text-center">
								<svg
									viewBox="0 0 24 24"
									fill="currentColor"
									data-slot="icon"
									aria-hidden="true"
									class="mx-auto size-12 text-gray-600"
								>
									<path
										d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
										clip-rule="evenodd"
										fill-rule="evenodd"
									/>
								</svg>
								<div class="mt-4 flex text-sm/6 text-gray-400">
									<label
										for="file-upload"
										class="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500 hover:text-indigo-300"
									>
										<span>Upload a file</span>
										<input id="file-upload" type="file" name="file-upload" class="sr-only" />
									</label>
									<p class="pl-1">or drag and drop</p>
								</div>
								<p class="text-xs/5 text-gray-400">PNG, JPG, GIF up to 10MB</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="border-b border-white/10 pb-12">
				<h2 class="text-base/7 font-semibold text-white">Personal Information</h2>
				<p class="mt-1 text-sm/6 text-gray-400">
					Use a permanent address where you can receive mail.
				</p>

				<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
					<div class="sm:col-span-3">
						<label for="first-name" class="block text-sm/6 font-medium text-white">First name</label
						>
						<div class="mt-2">
							<input
								id="first-name"
								type="text"
								name="first-name"
								autocomplete="given-name"
								class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
							/>
						</div>
					</div>

					<div class="sm:col-span-3">
						<label for="last-name" class="block text-sm/6 font-medium text-white">Last name</label>
						<div class="mt-2">
							<input
								id="last-name"
								type="text"
								name="last-name"
								autocomplete="family-name"
								class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
							/>
						</div>
					</div>

					<div class="sm:col-span-4">
						<label for="email" class="block text-sm/6 font-medium text-white">Email address</label>
						<div class="mt-2">
							<input
								id="email"
								type="email"
								name="email"
								autocomplete="email"
								class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
							/>
						</div>
					</div>

					<div class="sm:col-span-3">
						<label for="country" class="block text-sm/6 font-medium text-white">Country</label>
						<div class="mt-2 grid grid-cols-1">
							<select
								id="country"
								name="country"
								autocomplete="country-name"
								class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pl-3 pr-8 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
							>
								<option>United States</option>
								<option>Canada</option>
								<option>Mexico</option>
							</select>
							<svg
								viewBox="0 0 16 16"
								fill="currentColor"
								data-slot="icon"
								aria-hidden="true"
								class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
							>
								<path
									d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
									clip-rule="evenodd"
									fill-rule="evenodd"
								/>
							</svg>
						</div>
					</div>

					<div class="col-span-full">
						<label for="street-address" class="block text-sm/6 font-medium text-white"
							>Street address</label
						>
						<div class="mt-2">
							<input
								id="street-address"
								type="text"
								name="street-address"
								autocomplete="street-address"
								class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
							/>
						</div>
					</div>

					<div class="sm:col-span-2 sm:col-start-1">
						<label for="city" class="block text-sm/6 font-medium text-white">City</label>
						<div class="mt-2">
							<input
								id="city"
								type="text"
								name="city"
								autocomplete="address-level2"
								class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
							/>
						</div>
					</div>

					<div class="sm:col-span-2">
						<label for="region" class="block text-sm/6 font-medium text-white"
							>State / Province</label
						>
						<div class="mt-2">
							<input
								id="region"
								type="text"
								name="region"
								autocomplete="address-level1"
								class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
							/>
						</div>
					</div>

					<div class="sm:col-span-2">
						<label for="postal-code" class="block text-sm/6 font-medium text-white"
							>ZIP / Postal code</label
						>
						<div class="mt-2">
							<input
								id="postal-code"
								type="text"
								name="postal-code"
								autocomplete="postal-code"
								class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
							/>
						</div>
					</div>
				</div>
			</div>

			<div class="border-b border-white/10 pb-12">
				<h2 class="text-base/7 font-semibold text-white">Notifications</h2>
				<p class="mt-1 text-sm/6 text-gray-400">
					We'll always let you know about important changes, but you pick what else you want to hear
					about.
				</p>

				<div class="mt-10 space-y-10">
					<fieldset>
						<legend class="text-sm/6 font-semibold text-white">By email</legend>
						<div class="mt-6 space-y-6">
							<div class="flex gap-3">
								<div class="flex h-6 shrink-0 items-center">
									<div class="group grid size-4 grid-cols-1">
										<input
											id="comments"
											type="checkbox"
											name="comments"
											checked
											aria-describedby="comments-description"
											class="col-start-1 row-start-1 appearance-none rounded-sm border border-white/10 bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 indeterminate:border-indigo-500 indeterminate:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto"
										/>
										<svg
											viewBox="0 0 14 14"
											fill="none"
											class="group-has-disabled:stroke-white/25 pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white"
										>
											<path
												d="M3 8L6 11L11 3.5"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="group-has-checked:opacity-100 opacity-0"
											/>
											<path
												d="M3 7H11"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="group-has-indeterminate:opacity-100 opacity-0"
											/>
										</svg>
									</div>
								</div>
								<div class="text-sm/6">
									<label for="comments" class="font-medium text-white">Comments</label>
									<p id="comments-description" class="text-gray-400">
										Get notified when someones posts a comment on a posting.
									</p>
								</div>
							</div>
							<div class="flex gap-3">
								<div class="flex h-6 shrink-0 items-center">
									<div class="group grid size-4 grid-cols-1">
										<input
											id="candidates"
											type="checkbox"
											name="candidates"
											aria-describedby="candidates-description"
											class="col-start-1 row-start-1 appearance-none rounded-sm border border-white/10 bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 indeterminate:border-indigo-500 indeterminate:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto"
										/>
										<svg
											viewBox="0 0 14 14"
											fill="none"
											class="group-has-disabled:stroke-white/25 pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white"
										>
											<path
												d="M3 8L6 11L11 3.5"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="group-has-checked:opacity-100 opacity-0"
											/>
											<path
												d="M3 7H11"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="group-has-indeterminate:opacity-100 opacity-0"
											/>
										</svg>
									</div>
								</div>
								<div class="text-sm/6">
									<label for="candidates" class="font-medium text-white">Candidates</label>
									<p id="candidates-description" class="text-gray-400">
										Get notified when a candidate applies for a job.
									</p>
								</div>
							</div>
							<div class="flex gap-3">
								<div class="flex h-6 shrink-0 items-center">
									<div class="group grid size-4 grid-cols-1">
										<input
											id="offers"
											type="checkbox"
											name="offers"
											aria-describedby="offers-description"
											class="col-start-1 row-start-1 appearance-none rounded-sm border border-white/10 bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 indeterminate:border-indigo-500 indeterminate:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto"
										/>
										<svg
											viewBox="0 0 14 14"
											fill="none"
											class="group-has-disabled:stroke-white/25 pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white"
										>
											<path
												d="M3 8L6 11L11 3.5"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="group-has-checked:opacity-100 opacity-0"
											/>
											<path
												d="M3 7H11"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="group-has-indeterminate:opacity-100 opacity-0"
											/>
										</svg>
									</div>
								</div>
								<div class="text-sm/6">
									<label for="offers" class="font-medium text-white">Offers</label>
									<p id="offers-description" class="text-gray-400">
										Get notified when a candidate accepts or rejects an offer.
									</p>
								</div>
							</div>
						</div>
					</fieldset>

					<fieldset>
						<legend class="text-sm/6 font-semibold text-white">Push notifications</legend>
						<p class="mt-1 text-sm/6 text-gray-400">
							These are delivered via SMS to your mobile phone.
						</p>
						<div class="mt-6 space-y-6">
							<div class="flex items-center gap-x-3">
								<input
									id="push-everything"
									type="radio"
									name="push-notifications"
									checked
									class="not-checked:before:hidden relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-white/5 disabled:bg-white/10 disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
								/>
								<label for="push-everything" class="block text-sm/6 font-medium text-white"
									>Everything</label
								>
							</div>
							<div class="flex items-center gap-x-3">
								<input
									id="push-email"
									type="radio"
									name="push-notifications"
									class="not-checked:before:hidden relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-white/5 disabled:bg-white/10 disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
								/>
								<label for="push-email" class="block text-sm/6 font-medium text-white"
									>Same as email</label
								>
							</div>
							<div class="flex items-center gap-x-3">
								<input
									id="push-nothing"
									type="radio"
									name="push-notifications"
									class="not-checked:before:hidden relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-white/5 disabled:bg-white/10 disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
								/>
								<label for="push-nothing" class="block text-sm/6 font-medium text-white"
									>No push notifications</label
								>
							</div>
						</div>
					</fieldset>
				</div>
			</div>
		</div>

		<div class="mt-6 flex items-center justify-end gap-x-6">
			<button type="button" class="text-sm/6 font-semibold text-white">Cancel</button>
			<button
				type="submit"
				class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				>Save</button
			>
		</div>
	</form>
</div>
