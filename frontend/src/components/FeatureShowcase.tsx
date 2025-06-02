import { Grid, Typography, Box, Card, CardContent, Container, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaHandshake } from '@react-icons/all-files/fa/FaHandshake';
import { FaCalendarAlt } from '@react-icons/all-files/fa/FaCalendarAlt';
import { FaVideo } from '@react-icons/all-files/fa/FaVideo';
import { FaUserCheck } from '@react-icons/all-files/fa/FaUserCheck';

const features = [
	{
		title: 'AI-Powered Expert Matching',
		description: 'Our sophisticated algorithm analyzes your needs and instantly connects you with the perfect expert—no searching, no guessing, just results.',
		icon: <FaUserCheck />,
		color: 'primary',
		gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		stats: '99.7% Match Success',
	},
	{
		title: 'Lightning-Fast Booking',
		description: 'Book your consultation in under 30 seconds. Our streamlined process eliminates friction and gets you connected instantly.',
		icon: <FaCalendarAlt />,
		color: 'secondary',
		gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		stats: 'Average: 28 seconds',
	},
	{
		title: 'Studio-Quality Video Calls',
		description: 'Experience crystal-clear 4K video, noise cancellation, and seamless screen sharing that makes distance disappear.',
		icon: <FaVideo />,
		color: 'warning',
		gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
		stats: '4K • 60fps • Zero lag',
	},
	{
		title: 'Guaranteed Success',
		description: 'Not satisfied? Get your money back instantly. We stand behind every consultation with our ironclad satisfaction guarantee.',
		icon: <FaHandshake />,
		color: 'success',
		gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
		stats: '100% Money-back guarantee',
	},
];

export default function FeatureShowcase() {
	const [ref, inView] = useInView({
		triggerOnce: true,
		threshold: 0.2,
	});

	return (
		<Box
			ref={ref}
			sx={{
				position: 'relative',
				py: { xs: 4, md: 10, lg: 12 },
				px: { xs: 2, sm: 3, md: 6, lg: 8 },
				background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
				borderRadius: 0,
				overflow: 'hidden',
				'&::before': {
					content: '""',
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
					zIndex: 0,
				},
			}}
		>
			<Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
				<Box sx={{ textAlign: 'center', mb: 8 }}>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={inView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
					>
						<Typography
							variant="overline"
							sx={{
								color: 'primary.main',
								fontWeight: 700,
								letterSpacing: '0.1em',
								mb: 2,
								display: 'block',
								fontSize: '0.875rem',
							}}
						>
							PREMIUM FEATURES
						</Typography>
						<Typography
							variant="h2"
							sx={{
								fontWeight: 900,
								letterSpacing: '-0.03em',
								mb: 3,
								background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								fontSize: { xs: '2.5rem', md: '3.5rem' },
								lineHeight: 1.1,
							}}
						>
							Why Leading Professionals Choose Us
						</Typography>
						<Typography
							variant="h6"
							sx={{
								color: 'text.secondary',
								fontWeight: 400,
								maxWidth: '600px',
								mx: 'auto',
								lineHeight: 1.6,
								opacity: 0.8,
							}}
						>
							Experience the difference that premium technology and uncompromising quality make.
						</Typography>
					</motion.div>
				</Box>
				<Grid
					container
					spacing={{ xs: 3, md: 4 }}
					justifyContent="center"
				>
					{features.map((feature, index) => (
						<Grid
							size={{ xs: 12, sm: 6, lg: 3 }}
							key={feature.title}
							sx={{ display: 'flex' }}
						>
							<motion.div
								initial={{ opacity: 0, y: 60, scale: 0.9 }}
								animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
								transition={{
									duration: 0.8,
									delay: index * 0.2,
									type: 'spring',
									stiffness: 80,
								}}
								style={{ flex: 1, display: 'flex' }}
								whileHover={{ 
									y: -12,
									transition: { duration: 0.3, type: 'spring', stiffness: 400 }
								}}
							>
								<Card
									sx={{
										flex: 1,
										display: 'flex',
										flexDirection: 'column',
										minHeight: 360,
										border: 'none',
										background: 'rgba(255,255,255,0.95)',
										boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
										backdropFilter: 'blur(20px)',
										borderRadius: 4,
										position: 'relative',
										overflow: 'hidden',
										transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
										'&:hover': {
											boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
											background: 'rgba(255,255,255,1)',
											'& .feature-gradient': {
												opacity: 0.15,
											},
											'& .feature-icon': {
												transform: 'scale(1.1) rotate(5deg)',
											},
											'& .feature-stats': {
												opacity: 1,
												transform: 'translateY(0)',
											}
										},
										'&::before': {
											content: '""',
											position: 'absolute',
											top: 0,
											left: 0,
											right: 0,
											height: '4px',
											background: feature.gradient,
											zIndex: 1,
										}
									}}
								>
									<Box
										className="feature-gradient"
										sx={{
											position: 'absolute',
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											background: feature.gradient,
											opacity: 0.05,
											transition: 'opacity 0.3s ease',
											zIndex: 0,
										}}
									/>
									<CardContent
										sx={{
											textAlign: 'center',
											p: 4,
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											flex: 1,
											position: 'relative',
											zIndex: 1,
										}}
									>
										<Box
											className="feature-icon"
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												width: 80,
												height: 80,
												mb: 3,
												borderRadius: '50%',
												background: feature.gradient,
												color: 'white',
												fontSize: '2.5rem',
												boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
												transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
												'& svg': {
													width: '1em',
													height: '1em',
													filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
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
												color: 'text.primary',
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
												mb: 3,
												flex: 1,
											}}
										>
											{feature.description}
										</Typography>
										<Chip
											className="feature-stats"
											label={feature.stats}
											size="small"
											sx={{
												background: feature.gradient,
												color: 'white',
												fontWeight: 600,
												fontSize: '0.75rem',
												opacity: 0,
												transform: 'translateY(10px)',
												transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
												boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
												'& .MuiChip-label': {
													px: 2,
												}
											}}
										/>
									</CardContent>
								</Card>
							</motion.div>
						</Grid>
					))}
				</Grid>
			</Container>
		</Box>
	);
}