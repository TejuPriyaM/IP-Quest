'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentProfile, getRoleBasedRoute, type UserRole } from '@/lib/auth';

type AuthGuardProps = {
	children: React.ReactNode;
	allowedRoles?: UserRole[];
};

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
	const router = useRouter();
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		let isMounted = true;

		getCurrentProfile()
			.then((currentProfile) => {
				if (!currentProfile) {
					router.replace('/login');
					return;
				}

				if (allowedRoles && !allowedRoles.includes(currentProfile.role)) {
					router.replace(getRoleBasedRoute(currentProfile.role));
					return;
				}

				if (isMounted) setIsReady(true);
			})
			.catch(() => router.replace('/login'));

		return () => {
			isMounted = false;
		};
	}, [allowedRoles, router]);

	if (!isReady) {
		return <main className="section-shell flex min-h-[70vh] items-center justify-center py-16 text-sm text-slate-500" aria-busy="true">Checking your access...</main>;
	}

	return <>{children}</>;
}