import express from 'express'

/**
 * Main controller function to generate the profile page
 */
export const profile = async (req: express.Request, res: express.Response) => {
  try {
    const { uin } = req.query
    const nric = String(uin)
    res.render('callback', {
      data: [
        ['sgID', uin],
        ...[
          [
            'NRIC Last Four Characters',
            '*'.repeat(nric.length - 4) + nric.substring(nric.length - 4),
          ],
          ['Date of Birth', `${nric[2]} Jun 1993`],
        ],
      ],
    })
  } catch (error) {
    console.error(error)
    res.status(500).render('error', { error })
  }
}
