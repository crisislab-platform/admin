import useAuth from "../../../auth/useAuth";

export function UsersPanel() {
	const { user } = useAuth();
	return !!user ? (
		<>Users</>
	) : (
		<p>
			Something has gone terribly wrong - user is null but this is still
			rendering.
		</p>
	);
}
