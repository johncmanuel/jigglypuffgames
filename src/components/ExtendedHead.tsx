import Head from "next/head";

type ExtendedHeadProps = {
	title: string;
	description: string;
};

export const ExtendedHead: React.FC<ExtendedHeadProps> = ({
	title,
	description,
}) => {
	return (
		<Head>
			<title>{title}</title>
			<meta name="description" content={description} />
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1"
			/>
			<link rel="icon" href="/favicon.ico" />
		</Head>
	);
};
