import { Functor2 } from 'fp-ts/Functor';
import { Bifunctor2 } from 'fp-ts/Bifunctor';

const URI = 'Located';

export type URI = typeof URI;

declare module 'fp-ts/HKT' {
	interface URItoKind2<E, A> {
		readonly Located: Located<E, A>;
	}
}

export type Located<E, A> = {
	location: E;
	value: A;
};

export const Functor: Functor2<URI> = {
	URI,
	map: (fa, f) => map(f)(fa),
};

export const Bifunctor: Bifunctor2<URI> = {
	URI,
	bimap: (fea, f, g) => bimap(f, g)(fea),
	mapLeft: (fea, f) => mapLeft(f)(fea),
};

export const locate = <E, A>(location: E, value: A): Located<E, A> => ({
	location,
	value,
});

export const unlocate = <E, A>(fa: Located<E, A>): [E, A] => ([fa.location, fa.value]);

export const map =
	<A, B>(f: (a: A) => B) =>
	<E>(fa: Located<E, A>) => ({
		location: fa.location,
		value: f(fa.value),
	});

export const bimap =
	<E, G, A, B>(f: (e: E) => G, g: (a: A) => B) =>
	(fa: Located<E, A>) => ({
		location: f(fa.location),
		value: g(fa.value),
	});

export const mapLeft =
	<E, G>(f: (e: E) => G) =>
	<A>(fa: Located<E, A>) => ({
		location: f(fa.location),
		value: fa.value,
	});
