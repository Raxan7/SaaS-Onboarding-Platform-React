import { Grid, Typography, Box, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaHandshake } from '@react-icons/all-files/fa/FaHandshake';
import { FaCalendarAlt } from '@react-icons/all-files/fa/FaCalendarAlt';
import { FaVideo } from '@react-icons/all-files/fa/FaVideo';
import { FaUserCheck } from '@react-icons/all-files/fa/FaUserCheck';
import { useTheme } from '@mui/material/styles';

const features = [
	{
		title: 'Meet the Right Expert, Every Time',
		description: 'Intelligent matching algorithm connects you with the perfect professional for your specific needs.',
		icon: <FaUserCheck />,
		color: 'primary',
	},
	{
		title: 'Instant Booking, Zero Hassle',
		description: 'Schedule your consultation in seconds with our streamlined one-click booking system.',
		icon: <FaCalendarAlt />,
		color: 'secondary',
	},
	{
		title: 'Crystal-Clear Video Consultations',
		description: 'Professional-grade HD video meetings that ensure seamless communication with your expert.',
		icon: <FaVideo />,
		color: 'warning',
	},
	{
		title: 'Your Success, Our Promise',
		description: '100% satisfaction guarantee with every consultation, or your money back - no questions asked.',
		icon: <FaHandshake />,
		color: 'success',
	},
];

export default function FeatureShowcase() {
	const [ref, inView] = useInView({
		triggerOnce: true,
		threshold: 0.2,
	});
	const theme = useTheme();

	const iconColors: Record<string, string> = {
		primary: theme.palette.primary.main,
		secondary: theme.palette.secondary.main,
		warning: theme.palette.warning.main,
		success: theme.palette.success.main,
	};

	return (
		<Box
			ref={ref}
			sx={{
				position: 'relative',
				py: { xs: 6, md: 10 },
				px: { xs: 1, sm: 2, md: 0 },
				background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
				borderRadius: 6,
				boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
				overflow: 'hidden',
			}}
		>
			<Typography
				variant="h2"
				textAlign="center"
				gutterBottom
				sx={{
					fontWeight: 800,
					letterSpacing: '-0.02em',
					mb: 6,
				}}
			>
				Why Choose Us?
			</Typography>
			<Grid
				container
				spacing={{ xs: 3, md: 4 }}
				justifyContent="center"
			>
				{features.map((feature, index) => (
					<Grid
						size={{ xs: 12, sm: 6, md: 3 }}
						key={feature.title}
						sx={{ display: 'flex' }}
					>
						<motion.div
							initial={{ opacity: 0, y: 40, scale: 0.92 }}
							animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
							transition={{
								duration: 0.7,
								delay: index * 0.13,
								type: 'spring',
								stiffness: 80,
							}}
							style={{ flex: 1, display: 'flex' }}
						>
							<Card
								sx={{
									flex: 1,
									display: 'flex',
									flexDirection: 'column',
									minHeight: 280,
									border: 'none',
									background: 'rgba(255,255,255,0.95)',
									boxShadow: '0 8px 32px rgba(0, 107, 194, 0.08)',
									backdropFilter: 'blur(8px)',
									borderRadius: 3,
									transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
									'&:hover': {
										transform: 'translateY(-8px)',
										boxShadow: '0 16px 48px rgba(0, 107, 194, 0.15)',
										background: 'rgba(255,255,255,1)',
									},
								}}
							>
								<CardContent
									sx={{
										textAlign: 'center',
										p: 4,
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										flex: 1,
									}}
								>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											width: 72,
											height: 72,
											mb: 3,
											borderRadius: '50%',
											background: `linear-gradient(135deg, ${iconColors[feature.color]}20 0%, ${iconColors[feature.color]}08 100%)`,
											color: iconColors[feature.color],
											fontSize: '2.5rem',
											boxShadow: `0 4px 16px ${iconColors[feature.color]}20`,
											border: `2px solid ${iconColors[feature.color]}15`,
											transition: 'all 0.3s',
											'& svg': {
												width: '1em',
												height: '1em',
											},
										}}
									>
										{feature.icon}
									</Box>
									<Typography
										variant="h6"
										gutterBottom
										sx={{
											fontWeight: 700,
											letterSpacing: '-0.01em',
											mb: 2,
											fontSize: '1.25rem',
											lineHeight: 1.3,
										}}
									>
										{feature.title}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: 'text.secondary',
											lineHeight: 1.6,
											fontSize: '0.95rem',
											opacity: 0.85,
										}}
									>
										{feature.description}
									</Typography>
								</CardContent>
							</Card>
						</motion.div>
					</Grid>
				))}
			</Grid>
		</Box>
	);
}