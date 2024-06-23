import Head from "next/head";

type ExtendedHeadProps = {
	title: string;
};

const ExtendedHead: React.FC<ExtendedHeadProps> = ({
	title,
}) => {
	return (
		<Head>
			<title>{title}</title>
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1"
			/>
			<meta name="color-scheme" content="light dark" />
			<link rel="icon" href="/favicon.ico" />
		</Head>
	);
};

export default ExtendedHead;